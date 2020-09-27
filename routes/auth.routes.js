const {Router} = require('express')
const bcrypt = require('bcryptjs');
const jwt
const {check, validationResult, validate} = require('express-validation')
const User = require('../models/User')
const router = Router()

// /api/auth

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Некоректнный email').isEmail(),
        check('password', 'Минимальная длинна пароля 6 символов')
            .isLenght({min: 6})
    ],
    async (req,res) => {    
    try {
        const errors = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Некорректные данные при регистрации'
            })
        }

        const {email, password} = req.body
        
        const candidate = await User.findOne({email: email})

        if (candidate) {
            return res.status(400).json({message: 'Такой пользовательно уже существует'})
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({ email: email, password: hashedPassword})

        await user.save()

        res.status(201).json({message: 'Пользователь создан'})

    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})


// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Введите корректный email').normmailzeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req,res) => {    
    try {
        const errors = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Некорректные данные при входе в систему'
            })
        }

        const {email, password} = req.body

        // ищем по email
        const user = await User.findOne({ email: email })

        if(!user) {
            return res.status(400).json({message: 'Пользователь не найден'})
        }   

        // сраввниваем закешированный пароль 

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({message: 'Неверный пароль, попробуйте снова'})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get('jwtSecret')
        )


    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})

module.exports = router;