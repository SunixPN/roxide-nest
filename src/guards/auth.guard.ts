import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { options } from './../../config/telegram.config';
import * as crypto from "crypto"
import { User } from "src/entities/user.model";
import { InjectModel } from "@nestjs/sequelize";

interface IRequest extends Request {
    user: User
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@InjectModel(User) private readonly userRepository: typeof User) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<IRequest>()
        const authHeader = request.headers["authorization"]

        if (!authHeader) {
            throw new UnauthorizedException("Authorization header is missing")
        }

        const authDataSplit = authHeader.split(" ")[1]

        const parsedData = JSON.parse(authDataSplit)

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
    
        const secret_key = HMAC_SHA256(options.token, 'WebAppData')
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