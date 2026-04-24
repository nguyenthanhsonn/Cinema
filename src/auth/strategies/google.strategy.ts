import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../../config/google-oauth.config";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    private readonly logger = new Logger(GoogleStrategy.name);
    constructor(
        @Inject(googleOauthConfig.KEY)
        private googleConfig: ConfigType<typeof googleOauthConfig>,
    ) {
        super({
            clientID: googleConfig.clientID,
            clientSecret: googleConfig.clientSecret,
            callbackURL: googleConfig.callbackURL,
            scope: ['email', 'profile'], // lấy thông tin email và profile
        });
    }

    async validate(access_token: string, refresh_token: string, profile: Profile, done: VerifyCallback): Promise<any> {
        this.logger.log(`Google profile received for ${profile.emails?.[0]?.value ?? 'unknown-email'}`);

        // Strategy chỉ làm nhiệm vụ xác thực với Google và chuẩn hóa dữ liệu profile.
        // Phần tìm/tạo user trong DB sẽ để AuthService xử lý để tránh nhồi business logic vào strategy.
        const googleUser = {
            email: profile.emails?.[0]?.value ?? '',
            full_name: profile.displayName,
            avatar_url: profile.photos?.[0]?.value ?? null,
            // provider_id la id cua tai khoan Google (profile.id)
            provider_id: profile.id,
        };

        done(null, googleUser);
    }
}
