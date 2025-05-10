import sequelize from "../database/sequelize.js";
import { DataTypes } from "sequelize";
import User from "./user.js";

const Task = sequelize.define(
    'Task',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      descricao: {
        type: DataTypes.STRING
      },
      dataHora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      tipo: {
        type: DataTypes.ENUM('Pessoal', 'Profissional'),
        allowNull: false
      }
    },
    {
      // Other model options go here
    },
  );

User.hasMany(Task,{
  foreignKey: 'userId',
  allowNull: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Task.sync({force:true});

export default Task;