import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(
    Prisma.PrismaClientKnownRequestError,
    Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    status = HttpStatus.CONFLICT;
                    message = 'Dữ liệu đã tồn tại.';
                    break;

                case 'P2025':
                    status = HttpStatus.NOT_FOUND;
                    message = 'Không tìm thấy dữ liệu.';
                    break;

                case 'P2003':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Vi phạm khóa ngoại.';
                    break;        

                case 'P2011':
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Dữ liệu không hợp lệ.';
                    break;        

                default:
                    status = HttpStatus.BAD_REQUEST;
                    message = exception.message;
            }
        }

        if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Dữ liệu không hợp lệ';
        }

        response.status(status).json({
            statusCode: status,
            message,
            error: exception.code ?? 'UNKNOWN_ERROR',
        });
    }
}