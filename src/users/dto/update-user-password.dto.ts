import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserPasswordDto {
  /**
   * The current password of the user.
   */

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  /**
   * The new password of the user.
   */
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  /**
   * Confirmation of the new password. This should match the new password.
   */
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class AdminUpdateUserPasswordDto {
  /**
   * The new password of the user
   */
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  /**
   * Confirmation of the new password. This should match the new password.
   */
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
