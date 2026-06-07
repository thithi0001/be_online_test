DELIMITER $$
-- trigger cho kỳ thi
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