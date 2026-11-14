import * as studentExamService from '../services/studentExam.service.js';

export const startOrResume = async (req, res, next) => {
  try {
    const result = await studentExamService.startOrResumeAttempt(
      req.user.id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: 'Examination attempt active',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttempt = async (req, res, next) => {
  try {
    const result = await studentExamService.getStudentAttempt(
      req.user.id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const saveProgress = async (req, res, next) => {
  try {
    const result = await studentExamService.saveAttemptProgress(
      req.user.id,
      req.params.id,
      req.body.answers || []
    );
    res.status(200).json({
      success: true,
      message: 'Answers saved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const submit = async (req, res, next) => {
  try {
    const result = await studentExamService.submitAttempt(
      req.user.id,
      req.params.id,
      req.body.answers || []
    );
    res.status(200).json({
      success: true,
      message: 'Examination submitted successfully',
      data: { attempt: result },
    });
  } catch (error) {
    next(error);
  }
};
