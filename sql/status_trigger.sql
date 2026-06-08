DELIMITER $$
-- trigger cho kỳ thi
DROP TRIGGER IF EXISTS trg_exam_session_status;
CREATE TRIGGER trg_exam_session_status
BEFORE UPDATE ON exam_sessions
FOR EACH ROW
BEGIN
    IF OLD.session_status <> NEW.session_status THEN

        IF NOT (
            (OLD.session_status = 'draft'     AND NEW.session_status = 'published')
            OR
            (OLD.session_status = 'published' AND NEW.session_status = 'ongoing')
            OR
            (OLD.session_status = 'ongoing'   AND NEW.session_status = 'finished')
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid session status transition';
        END IF;

    END IF;
END$$

DELIMITER ;

DELIMITER $$
-- trigger cho lời mời tham gia lớp
DROP TRIGGER IF EXISTS trg_invitation_status;
CREATE TRIGGER trg_invitation_status
BEFORE UPDATE ON class_invitations
FOR EACH ROW
BEGIN
    IF OLD.invit_status <> NEW.invit_status THEN

        IF NOT (
            (OLD.invit_status = 'pending'
             AND NEW.invit_status IN ('accepted','expired'))
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid invitation status transition';
        END IF;

    END IF;
END$$

DELIMITER ;

DELIMITER $$
-- trigger cho trạng thái của bài làm
DROP TRIGGER IF EXISTS trg_attempt_status;
CREATE TRIGGER trg_attempt_status
BEFORE UPDATE ON student_attempts
FOR EACH ROW
BEGIN
    IF OLD.attempt_status <> NEW.attempt_status THEN

        IF NOT (
            (OLD.attempt_status = 'in_progress'
             AND NEW.attempt_status IN ('submitted','timeout'))
            OR
            (OLD.attempt_status = 'submitted'
             AND NEW.attempt_status = 'graded')
            OR
            (OLD.attempt_status = 'timeout'
             AND NEW.attempt_status = 'graded')
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid attempt status transition';
        END IF;

    END IF;
END$$

DELIMITER ;

DELIMITER $$
-- trigger cho yêu cầu thi lại
DROP TRIGGER IF EXISTS trg_retake_request_status;
CREATE TRIGGER trg_retake_request_status
BEFORE UPDATE ON retake_requests
FOR EACH ROW
BEGIN
    IF OLD.request_status <> NEW.request_status THEN

        IF NOT (
            (OLD.request_status = 'pending'
             AND NEW.request_status IN ('granted','rejected'))
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid retake request transition';
        END IF;

    END IF;
END$$

DELIMITER ;