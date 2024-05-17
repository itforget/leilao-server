import { Router } from 'express'
import { registerUser, loginUser, authUser, checkToken } from '../controllers/user'
const router = Router()

router.get("/user/:id", authUser, checkToken) 

router.post('/auth/register', registerUser)

router.post('/auth/login', loginUser)


export default router