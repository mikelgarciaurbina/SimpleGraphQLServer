import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLList
} from 'graphql';
import Sequelize from 'sequelize';

const Conn = new Sequelize(
  "graphqlintro",
  "prueba",
  "prueba",
  {
    dialect: "postgresql",
    host: "localhost"
  }
);

const UserModel = Conn.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  name: Sequelize.STRING,
  password: Sequelize.STRING
});

const ArticleModel = Conn.define('article', {
  title: Sequelize.STRING,
  description: Sequelize.STRING
});

UserModel.hasMany(ArticleModel);
ArticleModel.belongsTo(UserModel);

Conn.sync({force: true}).then(function () {
  return UserModel.create({
    email: 'mikel@prueba.com',
    name: 'Mikel',
    password: 'prueba'
  }).then((createdUser) => {
    createdUser.createArticle({
      title: "Prueba Title",
      description: "This is a description."
    })
  });
});

const ArticleType = new GraphQLObjectType({
  name: 'Article',
  description: 'This represents a Article',
  fields: () => {
    return {
      id: {
        type: GraphQLInt
      },
      title: {
        type: GraphQLString
      },
      description: {
        type: GraphQLString
      },
      user: {
        type: UserType,
        resolve: (parent, args, ast) => {
          return parent.getUser();
        }
      }
    }
  }
})

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'This represents a User',
  fields: () => {
    return {
      id: {
        type: GraphQLInt
      },
      email: {
        type: GraphQLString
      },
      name: {
        type: GraphQLString
      },
      password: {
        type: GraphQLString
      },
      articles: {
        type: new GraphQLList(ArticleType),
        resolve: (parent, args, ast) => {
          return parent.getArticles();
        }
      }
    };
  }
});

const ArticleQuery = {
  type: new GraphQLList(ArticleType),
  args: {
    id: {
      type: GraphQLString
    }
  },
  resolve: (parent, args, ast) => {
    return ArticleModel.findAll({where: args});
  }
};

const UserQuery = {
  type: new GraphQLList(UserType),
  args: {
    id: {
      type: GraphQLString
    }
  },
  resolve: (parent, args, ast) => {
    return UserModel.findAll({where: args});
  }
};

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => {
      return {
        users: UserQuery,
        articles: ArticleQuery
      }
    }
  })
});

export default Schema;
