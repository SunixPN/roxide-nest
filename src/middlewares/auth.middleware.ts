import { NextFunction, Response } from 'express'
import { User as userRepository } from '../entities/user.model'

export async function authMiddleware(req, res: Response, next: NextFunction) {

  req.user = await userRepository.findByPk(1)

  next()
}