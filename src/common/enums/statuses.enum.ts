export enum SessionStatus {
    DRAFT = 'draft', // bản nháp
    PUBLISHED = 'published', // đã mở kỳ thi
    ONGOING = 'ongoing', // đang diễn ra
    FINISHED = 'finished', // đã kết thúc
}

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    EXPIRED = 'expired',
}

export enum AttemptStatus {
    INPROGRESS = 'in_progress',
    SUBMITTED = 'submitted',
    TIMEOUT = 'timeout',
    GRADED = 'graded',
}

export enum RequestStatus {
    PENDING = 'pending',
    GRANTED = 'granted',
    REJECTED = 'rejected',
}