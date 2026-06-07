## Danh sách API từ các controller đính kèm

### `AttemptController` (`/attempts`)
1. `POST /attempts`
   - Tên: `create`
   - Nhiệm vụ: Tạo attempt mới cho học sinh
   - Input:
     - `@CurrentUser() user`
     - `@Body() sessionPassword: string`
     - `@Body() dto: CreateAttemptDto`
   - Output: `AttemptResponseDto`

2. `PATCH /attempts/:id`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật câu trả lời của attempt
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() body: any` (`newAnswerIds`, `deleteAnswerIds`)
   - Output: `AttemptResponseDto`

3. `PATCH /attempts/:id/submit`
   - Tên: `submit`
   - Nhiệm vụ: Nộp attempt
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() body: any` (`newAnswerIds`, `deleteAnswerIds`, `status`)
   - Output: `AttemptResponseDto`

4. `PATCH /attempts/:id/grade`
   - Tên: `grade`
   - Nhiệm vụ: Chấm attempt 
   - Input:
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `AttemptResponseDto`

5. `GET /attempts/current`
   - Tên: `getCurrent`
   - Nhiệm vụ: Lấy attempt hiện tại của học sinh
   - Input:
     - `@CurrentUser() user`
   - Output: `AttemptResponseDto`

6. `GET /attempts/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy attempt theo id
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `AttemptResponseDto`

7. `GET /attempts`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách attempt
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryAttemptDto`
   - Output: `PaginatedAttemptDto`

---

### `AuthController` (`/auth`)
1. `POST /auth/login`
   - Tên: `login`
   - Nhiệm vụ: Đăng nhập
   - Input: `@Body() dto: LoginDto`
   - Output: Không có DTO serialize rõ ràng (trả về kết quả của `authService.login`)

2. `POST /auth/register`
   - Tên: `register`
   - Nhiệm vụ: Đăng ký
   - Input: `@Body() dto: RegisterDto`
   - Output: Không có DTO serialize rõ ràng

3. `POST /auth/password-reset-requests`
   - Tên: `resetPasswordRequest`
   - Nhiệm vụ: Yêu cầu đặt lại mật khẩu
   - Input: không có body
   - Output: Không có DTO serialize rõ ràng

4. `POST /auth/password-resets`
   - Tên: `resetPassword`
   - Nhiệm vụ: Thực hiện đặt lại mật khẩu
   - Input: không có body
   - Output: Không có DTO serialize rõ ràng

---

### `ClassController` (`/classes`)
1. `POST /classes`
   - Tên: `create`
   - Nhiệm vụ: Tạo lớp mới
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: CreateClassDto`
   - Output: `ClassRespsonseDto`

2. `GET /classes`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách lớp
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryClassDto`
   - Output: `PaginatedClassDto`

3. `GET /classes/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết lớp
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `ClassRespsonseDto`

4. `PATCH /classes/:id`
   - Tên: `update`
   - Nhiệm vụ: Đổi tên lớp
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() newClassName: string`
   - Output: `ClassRespsonseDto`

5. `POST /classes/:id`
   - Tên: `addOneStudent`
   - Nhiệm vụ: Thêm một học sinh vào lớp
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() dto: AddOneStudentDto`
   - Output: `ClassMemberResponseDto`

6. `POST /classes/:id/bulk`
   - Tên: `addStudents`
   - Nhiệm vụ: Thêm nhiều học sinh từ danh sách
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() dtos: ImportStudentDto[]`
   - Output: `ClassMemberResponseDto`

7. `GET /classes/:id/members`
   - Tên: `getMembers`
   - Nhiệm vụ: Lấy danh sách thành viên lớp
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Query() query: QueryUserDto`
   - Output: `PaginatedUserDto`

---

### `SessionController` (`/sessions`)
1. `POST /sessions`
   - Tên: `create`
   - Nhiệm vụ: Tạo phiên kiểm tra
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: CreateExamSessionDto`
   - Output: `ExamSessionResponseDto`

2. `PATCH /sessions/:id`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật phiên kiểm tra
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() dto: UpdateExamSessionDto`
   - Output: `ExamSessionResponseDto`

3. `GET /sessions`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách phiên kiểm tra
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QuerySessionDto`
   - Output: `PaginatedSessionDto`

4. `GET /sessions/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết phiên kiểm tra
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `ExamSessionResponseDto`

5. `DELETE /sessions/:id`
   - Tên: `delete`
   - Nhiệm vụ: Xóa phiên kiểm tra
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: không có DTO serialize rõ ràng

---

### `TemplateController` (`/templates`)
1. `POST /templates`
   - Tên: `create`
   - Nhiệm vụ: Tạo mẫu đề
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: CreateExamTemplateDto`
   - Output: `ExamTemplateResponseDto`

2. `PATCH /templates/:id`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật mẫu đề
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() dto: UpdateExamTemplateDto`
   - Output: `ExamTemplateResponseDto`

3. `GET /templates`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách mẫu đề
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryTemplateDto`
   - Output: `PaginatedTemplateDto`

4. `GET /templates/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết mẫu đề
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `ExamTemplateResponseDto`

5. `DELETE /templates/:id`
   - Tên: `delete`
   - Nhiệm vụ: Xóa mẫu đề
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: không có DTO serialize rõ ràng

6. `GET /templates/:id/questions`
   - Tên: `getQuestions`
   - Nhiệm vụ: Lấy câu hỏi của mẫu đề
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `TemplateQuestionArrayResponseDto`

---

### `QuestionController` (`/questions`)
1. `POST /questions`
   - Tên: `create`
   - Nhiệm vụ: Tạo câu hỏi mới
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: CreateQuestionBankDto`
   - Output: `QuestionResponseDto`

2. `POST /questions/bulk`
   - Tên: `createMany`
   - Nhiệm vụ: Tạo nhiều câu hỏi
   - Input:
     - `@CurrentUser() user`
     - `@Body() dtos: CreateQuestionBankDto[]`
   - Output: `QuestionResponseDto`

3. `PATCH /questions/:id`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật câu hỏi
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() dto: UpdateQuestionBankDto`
   - Output: `QuestionResponseDto`

4. `DELETE /questions/:id`
   - Tên: `delete`
   - Nhiệm vụ: Xóa câu hỏi
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: không có DTO serialize rõ ràng

5. `GET /questions`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách câu hỏi
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryQuestionDto`
   - Output: `PaginatedQuestionDto`

6. `GET /questions/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết câu hỏi
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `QuestionResponseDto`

---

### `NotificationController` (`/notifications`)
1. `GET /notifications`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy thông báo
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryNotificationDto`
   - Output: `PaginatedNotificationDto`

2. `GET /notifications/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết thông báo
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `NotificationResponseDto`

3. `PATCH /notifications/:id`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật trạng thái thông báo
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: không có DTO serialize rõ ràng

---

### `ProctoringController` (`/proctorings`)
1. `POST /proctorings`
   - Tên: `create`
   - Nhiệm vụ: Tạo sự kiện giám sát
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: CreateEventDto`
   - Output: không có DTO serialize rõ ràng

2. `GET /proctorings`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách sự kiện giám sát
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryEventDto`
   - Output: `PaginatedEventDto`

3. `GET /proctorings/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết sự kiện giám sát
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `ProctoringEventResponseDto`

---

### `RetakeController` (`/retakes`)
1. `POST /retakes`
   - Tên: `create`
   - Nhiệm vụ: Tạo yêu cầu thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: CreateRetakeDto`
   - Output: `RetakeResponseDto`

2. `GET /retakes`
   - Tên: `getManyRetake`
   - Nhiệm vụ: Lấy danh sách yêu cầu thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryRetakeDto`
   - Output: `PaginatedRetakeDto`

3. `GET /retakes/:id`
   - Tên: `getRetakeById`
   - Nhiệm vụ: Lấy chi tiết yêu cầu thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `RetakeResponseDto`

4. `PATCH /retakes/:id/reject`
   - Tên: `reject`
   - Nhiệm vụ: Từ chối yêu cầu thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `RetakeResponseDto`

5. `POST /retakes/:id/grant`
   - Tên: `grantPermission`
   - Nhiệm vụ: Cấp quyền cho yêu cầu thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() dto: CreatePermissionDto`
   - Output: `PermissionResponseDto`

6. `GET /retakes/permissions`
   - Tên: `getManyPermission`
   - Nhiệm vụ: Lấy danh sách quyền thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QueryPermissionDto`
   - Output: `PaginatedPermissionDto`

7. `GET /retakes/permissions/:id`
   - Tên: `getPermissionById`
   - Nhiệm vụ: Lấy chi tiết quyền thi lại
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `PermissionResponseDto`

---

### `SubjectController` (`/subjects`)
1. `POST /subjects`
   - Tên: `create`
   - Nhiệm vụ: Tạo môn học
   - Input:
     - `@CurrentUser() user`
     - `@Body() subjectName: string`
   - Output: `SubjectResponseDto`

2. `GET /subjects`
   - Tên: `getMany`
   - Nhiệm vụ: Lấy danh sách môn học
   - Input:
     - `@CurrentUser() user`
     - `@Query() query: QuerySubjectDto`
   - Output: `PaginatedSubjectDto`

3. `GET /subjects/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy chi tiết môn học
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `SubjectResponseDto`

4. `PATCH /subjects/:id`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật tên môn học
   - Input:
     - `@CurrentUser() user`
     - `@Param('id', ParseIntPipe) id: number`
     - `@Body() newSubjectName: string`
   - Output: `SubjectResponseDto`

---

### `UserController` (users)
1. `POST /users`
   - Tên: `create`
   - Nhiệm vụ: Tạo người dùng mới
   - Input: `@Body() dto: CreateUserDto`
   - Output: `UserResponseDto`

2. `GET /users/:id`
   - Tên: `getById`
   - Nhiệm vụ: Lấy thông tin người dùng theo id
   - Input:
     - `@Param('id', ParseIntPipe) id: number`
   - Output: `UserResponseDto`

3. `GET /users`
   - Tên: `getAll`
   - Nhiệm vụ: Lấy danh sách người dùng
   - Input:
     - `@Body() userIds: number[]`
     - `@Query() query: QueryUserDto`
   - Output: `PaginatedUserDto`

4. `GET /users/me`
   - Tên: `getMyProfile`
   - Nhiệm vụ: Lấy thông tin profile của người dùng hiện tại
   - Input: `@CurrentUser() user`
   - Output: `UserResponseDto`

5. `PATCH /users/me`
   - Tên: `update`
   - Nhiệm vụ: Cập nhật profile người dùng hiện tại
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: UpdateUserDto`
   - Output: `UserResponseDto`

6. `PATCH /users/password`
   - Tên: `changePassword`
   - Nhiệm vụ: Đổi mật khẩu người dùng
   - Input:
     - `@CurrentUser() user`
     - `@Body() dto: ChangePasswordDto`
   - Output: không có DTO serialize rõ ràng