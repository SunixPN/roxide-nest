import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/entities/user.model";
import { InjectModel } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto"

export interface IRequest extends Request {
    user: User
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectModel(User) private readonly userRepository: typeof User,
        private readonly configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<IRequest>()
        const authHeader = request.headers["authorization"]

        if (!authHeader) {
            throw new UnauthorizedException("Authorization header is missing")
        }

        const authDataSplit = authHeader.split(" ")[1]

        const token = "7340299537:AAF-8LswAbpL-ARM-A0tEXLxbjNlTtPSAjk"
        // const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN")

        const urlParams: URLSearchParams = new URLSearchParams(authDataSplit)
        const hash = urlParams.get("hash")

        urlParams.delete("hash")
        urlParams.sort()

        let dataCheckString = ""

        for (const [key, value] of urlParams.entries()) {
            dataCheckString += `${key}=${value}\n`
        }

        dataCheckString = dataCheckString.slice(0, -1)

        const secret = crypto.createHmac("sha256", "WebAppData").update(token)
        const calculatedHash = crypto.createHmac("sha256", secret.digest()).update(dataCheckString).digest("hex")

        console.log(urlParams, calculatedHash, hash)

        if (calculatedHash !== hash) {
            throw new UnauthorizedException("No valid telegram data")
        }

        const user = await this.userRepository.findOne({
            where: {
                telegramId: JSON.parse(urlParams.get("user")).id
            }
        })

        if (!user) {
            throw new UnauthorizedException("user was not found")
        }

        request.user = user

        return true
            
    }
}