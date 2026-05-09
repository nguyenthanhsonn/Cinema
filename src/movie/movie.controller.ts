import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateMovieDto } from './dto/request/create-movie.dto';
import { MovieService } from './movie.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/user/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateMovieDto } from './dto/request/update-movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  // ─── Admin ───────────────────────────────────────────────────────────────
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async createFilm(@Body() dto: CreateMovieDto) {
    return this.movieService.createFilm(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async updateMovie(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateMovieDto){
    return this.movieService.updateMovies(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteMovie(@Param('id', new ParseUUIDPipe()) id: string){
    return this.movieService.deleteMovie(id);
  }

  // ─── Public ───────────────────────────────────────────────────────────────
  @Get()
  async getMovies() {
    return this.movieService.getAllMovies();
  }

  @Get('showing')
  async getShowingMovies() {
    return this.movieService.getShowingMovies();
  }

  @Get('coming-soon')
  async getComingSoonMovies() {
    return this.movieService.getComingSoonMovies();
  }

  @Get('genre/all')
  async getAllGenre() {
    return this.movieService.getAllGenre();
  }

  // ─── Param routes (phải để cuối) ─────────────────────────────────────────
  @Get(':id')
  async detailMovie(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.movieService.getMovieById(id);
  }
}