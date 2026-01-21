const { Course } = require('../models');

exports.createCourse = async (req, res) => {
  const { title, description } = req.body;
  const c = await Course.create({ title, description, teacherId: req.user?.id });
  res.json(c);
};

exports.list = async (req, res) => {
  const list = await Course.findAll();
  res.json(list);
};
