import * as Yup from 'yup'
import User from '../models/User'
import jwt from 'jsonwebtoken'
import authConfigs from '../../config/auth'

class SessionController {
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    })

    const userEmailorPasswordIncorrect = () => {
      return response
        .status(400)
        .json({ error: 'Make sure your password or email are correct' })
    }

    if (!(await schema.isValid(request.body))) {
      return userEmailorPasswordIncorrect()
    }

    const { email, password } = request.body

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      return userEmailorPasswordIncorrect()
    }

    if (!(await user.checkPassword(password))) {
      return userEmailorPasswordIncorrect()
    }

    return response.status(200).json({
      id: user.id,
      name: user.name,
      email,
      password,
      admin: user.admin,
      token: jwt.sign({ id: user.id, name: user.name }, authConfigs.secret, {
        expiresIn: authConfigs.expiresIn,
      }),
    })
  }
}

export default new SessionController()
