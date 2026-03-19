const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 *
 * @body
 * {
 *   "name": "John Doe",
 *   "email": "john@gmail.com",
 *   "password": "123456",
 *   "userTypeId": "uuid-string"
 * }
 *
 * @response 201
 * {
 *   message: "User created",
 *   user: { id, name, email, createdAt, userType }
 * }
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, userTypeId } = req.body;

    // validate userTypeId (UUID string)
    if (!userTypeId || typeof userTypeId !== 'string') {
      return res.status(400).json({ message: 'Valid userTypeId (UUID) is required' });
    }

    // check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // validate user type
    const userType = await prisma.userType.findUnique({
      where: { id: userTypeId }
    });

    if (!userType) {
      return res.status(400).json({ message: 'Invalid userTypeId' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userTypeId
      },
      include: {
        userType: true
      }
    });

    // remove password from response
    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: 'User created',
      user: safeUser
    });

  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 *
 * @body
 * {
 *   "email": "naiyeraazam@gmail.com",
 *   "password": "123456"
 * }
 *
 * @response 200
 * {
 *   message: "Login successful",
 *   token: "jwt-token",
 *   user: { id, name, email, userType }
 * }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user with role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userType: true }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // generate token
    const token = jwt.sign(
      { userId: user.id }, // UUID
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // remove password
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


/**
 * @route   GET /api/users
 * @desc    Get all users with filters & pagination
 * @access  Protected
 *
 * @query
 * ?page=1
 * ?limit=10
 * ?name=john
 * ?email=gmail
 * ?userType=admin
 *
 * @response 200
 * {
 *   message: "Users fetched successfully",
 *   data: [...],
 *   pagination: { total, page, limit, totalPages }
 * }
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      email,
      userType
    } = req.query;

    const skip = (page - 1) * limit;

    // dynamic filters
    const where = {
      ...(name && {
        name: { contains: name, mode: 'insensitive' }
      }),
      ...(email && {
        email: { contains: email, mode: 'insensitive' }
      }),
      ...(userType && {
        userType: { type: userType }
      })
    };

    // total count
    const total = await prisma.user.count({ where });

    // fetch users
    const users = await prisma.user.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        userType: {
          select: { id: true, type: true }
        }
      }
    });

    return res.status(200).json({
      message: 'Users fetched successfully',
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


/**
 * @route   GET /api/users/me
 * @desc    Get current logged-in user
 * @access  Protected
 *
 * @headers
 * Authorization: Bearer <token>
 *
 * @response 200
 * {
 *   id, name, email, createdAt, userType
 * }
 */
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }, // UUID from token
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        userType: true
      }
    });

    return res.status(200).json(user);

  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};