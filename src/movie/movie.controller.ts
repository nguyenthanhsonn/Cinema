import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateMovieDto } from './dto/resquest/create-movie.dto';
// import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/user/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async createFilm(@Body() dto: CreateMovieDto){
    return this.movieService.createFilm(dto);
  }
  
  @Get('genre/all')
  async getAllGenre() {
    return this.movieService.getAllGenre();
  }

  @Get('showing')
  async getShowingMovies() {
    return this.movieService.getShowingMovies();
  }

  @Get(':id')
  async detailMovie(@Param('id') id: string){
    return this.movieService.getMovieById(id);
  }
}
