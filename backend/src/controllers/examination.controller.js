import * as examService from '../services/examination.service.js';

export const create = async (req, res, next) => {
  try {
    const exam = await examService.createExamination(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Examination created in DRAFT status',
      data: { examination: exam },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyExaminations = async (req, res, next) => {
  try {
    const examinations = await examService.getInstructorExaminations(req.user.id);
    res.status(200).json({
      success: true,
      data: { examinations },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const examination = await examService.getInstructorExaminationById(
      req.user.id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: { examination },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const examination = await examService.updateExamination(
      req.user.id,
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Examination updated successfully',
      data: { examination },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const result = await examService.deleteExamination(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const publish = async (req, res, next) => {
  try {
    const examination = await examService.publishExamination(
      req.user.id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: 'Examination published successfully',
      data: { examination },
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailable = async (req, res, next) => {
  try {
    const examinations = await examService.getAvailableExaminationsForStudents();
    res.status(200).json({
      success: true,
      data: { examinations },
    });
  } catch (error) {
    next(error);
  }
};

