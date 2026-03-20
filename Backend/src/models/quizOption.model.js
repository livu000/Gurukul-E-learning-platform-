const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizOption = sequelize.define('QuizOption', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  questionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'question_id' },
  optionText: { type: DataTypes.STRING(500), allowNull: false, field: 'option_text' },
  isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_correct' },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'sort_order' }
}, {
  tableName: 'quiz_options',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { name: 'idx_options_question', fields: [{ name: 'question_id' }] },
    { name: 'idx_options_correct', fields: [{ name: 'question_id' }, { name: 'is_correct' }] },
    { name: 'idx_options_order', fields: [{ name: 'question_id' }, { name: 'sort_order' }] }
  ]
});

module.exports = QuizOption;
