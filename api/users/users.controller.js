const NotFoundError = require("../../errors/not-found");
const UnauthorizedError = require("../../errors/unauthorized");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const usersService = require("./users.service");
const articlesService = require("../articles/articles.service");

class UsersController {
  async getAll(req, res, next) {
    // console.log("getAll Users Controlleur :", req.user);
    try {
      const users = await usersService.getAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    // console.log("getById Users Controlleur :", req.user);
    try {
      const id = req.params.id;
      const user = await usersService.get(id);
      if (!user) {
        throw new NotFoundError();
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    // console.log("create Users Controlleur :", req.user);
    try {
      const user = await usersService.create(req.body);
      user.password = undefined; 
      
      req.io.emit("user:create", user);
      
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    // console.log("update Users Controlleur :", req.user);
    try {
      const id = req.params.id;
      const data = req.body;
      const userModified = await usersService.update(id, data);
      
      if (!userModified) {
        throw new NotFoundError("User not found");
      }
      
      userModified.password = undefined;
      
      req.io.emit("user:update", userModified);
      
      res.json(userModified);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    // console.log("delete Users Controlleur :", req.user);
    try {
      const id = req.params.id;
      const user = await usersService.delete(id);
      
      if (!user) {
        throw new NotFoundError("User not found");
      }
      
      req.io.emit("user:delete", { id });
      
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }


  async login(req, res, next) {
    // console.log("login");
    try {
      const { email, password } = req.body;
      // console.log("email:", email);
      // console.log("password:", password);
      // console.log("userId:", userId);
      const userId = await usersService.checkPasswordUser(email, password);
      
      if (!userId) {
        throw new UnauthorizedError();
      }
      
      const token = jwt.sign({ userId }, config.secretJwtToken, {
        expiresIn: "3d",
      });
      
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsersController();