import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/entities/user.model";
import { InjectModel } from "@nestjs/sequelize";
import { ConfigService } from "@nestjs/config";
import * as queryString from "querystring";

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

        const hh = "edadd39d6bf3f7a460e364342d1fe81ef06b641f659ec4f93979cfb2bea1cb22"

        console.log(decodeURIComponent(authDataSplit))

        function parse(inputString: string) {
            const regex = /([^&=]+)=([^&]*)/g;

            const resultObj = {};
            let match;

            while ((match = regex.exec(inputString)) !== null) {
                const [ , key, value ] = match;
                resultObj[key] = decodeURIComponent(value);
            }

            return resultObj
        }

        const parsedData = parse(decodeURIComponent(authDataSplit)) as any

        const hash = parsedData.hash
        const data_keys = Object.keys(parsedData).filter(v => v !== 'hash').sort()
    
        const items = data_keys.map(key => key + '=' + parsedData[key])
    
        const data_check_string = items.join('\n')
    
        function HMAC_SHA256(value: any, key: any) {
            const crypto = require('crypto');
            return crypto.createHmac('sha256', key).update(value).digest()
        }
    
        function hex(bytes: any) {
            return bytes.toString('hex');
        }

        const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN")

        const secret_key = HMAC_SHA256(token, 'WebAppData')
        const hashGenerate = hex(HMAC_SHA256(data_check_string, secret_key))

        console.log(parsedData, hashGenerate, hash)
    
        if (hashGenerate !== hash) {
            throw new UnauthorizedException("No valid telegram data")
        }

        const user = await this.userRepository.findOne({
            where: {
                telegramId: JSON.parse(parsedData.user).id
            }
        })

        if (!user) {
            throw new UnauthorizedException("user was not found")
        }

        request.user = user

        return true
            
    }
}