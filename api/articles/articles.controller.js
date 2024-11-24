const NotFoundError = require("../../errors/not-found");
const UnauthorizedError = require("../../errors/unauthorized");
const articlesService = require("./articles.service");
const User = require("../users/users.model");

class ArticlesController {
  async create(req, res, next) {
    // console.log("create Articles Controlleur :", req.body, req.body.user);
    try {
      const articleData = {
        ...req.body,
        user: req.body.user,
      };

      const article = await articlesService.create(articleData);
      
      req.io.emit("article:create", article);

      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    // console.log("update Articles Controlleur :", req.params.id, req.body);
    try {
      const id = req.params.id;
      const data = req.body;
      const articleModified = await articlesService.update(id, data);
      if (!articleModified) {
        throw new NotFoundError("Article not found");
      }

      res.json(articleModified);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    // console.log("delete Articles Controlleur :", req.params.id);
    try {
       const id = req.params.id;
      
      req.io.emit("article:delete", { id }); // Emettre un event temps réel
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

 async getArticlesByUserId(req, res, next) {
    // console.log("getArticlesByUserId Articles Controlleur :", req.params.userId);
    try {
      const userId = req.params.userId;
      const articles = await articlesService.getArticlesByUserId(userId);
      res.json(articles);
    } catch (err) {
      next(err);
    }
 }

}

module.exports = new ArticlesController();
