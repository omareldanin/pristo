import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/app/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { loginResponse } from './auth.dto';
import { env } from 'src/config';
import { UserRole } from '@prisma/client';

const phonesOtp: { phone: string; otp: string }[] = [];

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    phone: string,
    password: string,
    fcm: string | undefined,
    role: UserRole,
  ): Promise<loginResponse> {
    let user = await this.usersService.findOne({
      phone: phone,
      id: undefined,
      role,
    });

    if (!user) {
      throw new UnauthorizedException('خطأ في البيانات , اعد المحاوله');
    } else if (
      user &&
      !bcrypt.compareSync(
        password + (env.PASSWORD_SALT as string),
        user.password,
      )
    ) {
      throw new UnauthorizedException('خطأ في البيانات , اعد المحاوله');
    }

    const payload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      wallet: user.wallet,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: env.ACCESS_TOKEN_SECRET as string,
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(
      {
        id: user?.id,
      },
      {
        secret: env.REFRESH_TOKEN_SECRET as string,
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    const result = await this.usersService.updateToken({
      id: +user.id,
      refreshToken,
      fcm,
    });

    return {
      message: 'تم تسجيل الدخول بنجاح',
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wallet: user.wallet,
      token,
      refreshToken: result.refresh_token,
    };
  }

  async refreshToken(refresh_token: string) {
    // 1) Check if token is valid
    const decoded = this.jwtService.verify(refresh_token, {
      secret: env.REFRESH_TOKEN_SECRET as string,
    }) as {
      id: number;
    };

    // 2) Check if refresh token is in the database
    const refreshTokens = await this.usersService.getUserRefreshTokens(
      decoded.id,
    );

    if (!refreshTokens || !refreshTokens.includes(refresh_token)) {
      throw new UnauthorizedException('الرجاء تسجيل الدخول');
    }

    const user = await this.usersService.getUserByID(decoded.id);
    if (!user) {
      throw new UnauthorizedException('الرجاء تسجيل الدخول');
    }

    const payload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      wallet: user.wallet,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: env.ACCESS_TOKEN_SECRET as string,
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });

    return {
      message: 'success',
      token: token,
    };
  }

  async signUp(data: {
    name: string;
    phone: string;
    password: string;
    fcm: string | undefined;
  }): Promise<loginResponse> {
    let user = await this.usersService.findOne({
      phone: data.phone,
      id: undefined,
      role: 'CUSTOMER',
    });

    if (user) {
      throw new UnauthorizedException('هذا الرقم مسجل مسبفا');
    }

    const createdUser = await this.usersService.createUser(data);

    const payload = {
      id: createdUser.id,
      name: createdUser.name,
      phone: createdUser.phone,
      avatar: createdUser.avatar,
      wallet: createdUser.wallet,
      role: createdUser.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: env.ACCESS_TOKEN_SECRET as string,
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(
      {
        id: user?.id,
      },
      {
        secret: env.REFRESH_TOKEN_SECRET as string,
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    const result = await this.usersService.updateToken({
      id: +user.id,
      refreshToken,
      fcm: data.fcm,
    });

    return {
      message: 'تم تسجيل الدخول بنجاح',
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wallet: user.wallet,
      token,
      refreshToken: result.refresh_token,
    };
  }

  async sendOtp(phone: string): Promise<{ otp: string }> {
    if (!phone.startsWith('216') && phone.length !== 11) {
      throw new UnauthorizedException('رقم الهاتف غير صحيح');
    }
    const randomPart = Math.floor(10000 + Math.random() * 90000);

    const sms = `هذا الرمز خاص بك : ${randomPart} 
    لا تقم بمشاركه الرمز مع احد.`;

    const date = new Date();

    const formattedDate = date.toLocaleDateString('fr-FR'); // "11/05/2025"
    const formattedTime = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }); // "10:00"

    const otpRes = await fetch(
      `https://app.tunisiesms.tn/Api/Api.aspx?fct=sms&key=${env.OTP_KEY}&mobile=${phone}&sms=${sms}&sender=Pristo&date=${formattedDate}&heure=${formattedTime}`,
    );

    const checkIfExist = phonesOtp.findIndex((p) => p.phone === phone);

    if (checkIfExist >= 0) {
      phonesOtp[checkIfExist] = { phone: phone, otp: randomPart + '' };
    } else {
      phonesOtp.push({ phone: phone, otp: randomPart + '' });
    }

    return { otp: `${randomPart}` };
  }

  async confirmOtp(data: {
    phone: string;
    otp: string;
  }): Promise<{ message: string }> {
    const phoneData = phonesOtp.find((p) => p.phone === data.phone);

    const checkIfExist = phonesOtp.findIndex((p) => p.phone === data.phone);
    phonesOtp[checkIfExist] = { phone: '', otp: '' };
    if (!phoneData || phoneData.otp !== data.otp) {
      throw new UnauthorizedException('هذا الرقم غير صالح');
    }
    return { message: 'valid' };
  }

  async resetPassword(data: {
    phone: string;
    password: string;
    oldPassword: string;
  }): Promise<loginResponse> {
    let user = await this.usersService.findOne({
      phone: data.phone,
      id: undefined,
      role: 'CUSTOMER',
    });

    if (
      user &&
      data.oldPassword &&
      !bcrypt.compareSync(
        data.oldPassword + (env.PASSWORD_SALT as string),
        user.password,
      )
    ) {
      throw new UnauthorizedException('خطأ في البيانات , اعد المحاوله');
    } else {
      await this.usersService.resetPassword({
        id: user.id,
        password: data.password,
      });
    }

    const payload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: env.ACCESS_TOKEN_SECRET as string,
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(
      {
        id: user?.id,
      },
      {
        secret: env.REFRESH_TOKEN_SECRET as string,
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    const result = await this.usersService.updateToken({
      id: +user.id,
      refreshToken,
      fcm: undefined,
    });

    return {
      message: 'تم تغيير الرقم السري بنجاح',
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      wallet: user.wallet,
      token,
      refreshToken: result.refresh_token,
    };
  }

  async updateProfile(data: {
    id: number;
    name: string | undefined;
    phone: string | undefined;
    avatar: string | undefined;
    fcm: string | undefined;
    online: string | undefined;
  }): Promise<loginResponse> {
    const user = await this.usersService.updateProfile(data);

    return {
      message: 'تم التعديل بنجاح',
      id: user.id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      wallet: user.wallet,
      role: user.role,
      token: user.token,
      refreshToken: user.refresh_token,
    };
  }
}
