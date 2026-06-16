import { BookingResponseDto } from "./booking-detail-response.dto";

export class GetBookingResponseDto {
    success: boolean;
    message: string;
    data: {
        bookings: BookingResponseDto[];
    };
    total: number;
    page: number;
    limit: number;
}