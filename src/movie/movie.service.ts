import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateMovieDto } from './dto/request/create-movie.dto';
import { DetailMovieResponseDto } from './dto/request/detail-movie-res.dto';
import { CreateMovieResponseDto } from './dto/response/create-movie-response.dto';
import { GetShowingMoviesResponseDto } from './dto/response/get-showing-movies-response.dto.ts';
import { MovieStatus } from './enums/movie.enum';
import { Actor } from './entities/actor.entity';
import { Genre } from './entities/genre.entity';
import { MovieCast } from './entities/movie-cast.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { Movie } from './entities/movie.entity';
import { MovieItemDto } from './dto/response/movie-item.dto';
import { GetAllMovieResponseDto } from './dto/response/get-all-movie.dto';
import { UpdateMovieDto } from './dto/request/update-movie.dto';
import { UpdateMovieResponseDto } from './dto/response/update-movie.dto';
import { DeleteMovieResponseDto } from './dto/response/delete-movie.response.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    private readonly dataSource: DataSource,
  ) { }

  // Tìm phim theo tên
  private async findMovieByTitle(title: string): Promise<Movie[]> {
    return this.movieRepository.find({ where: { title } });
  }
  // Tìm theo ID
  private async findMovieById(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id }, relations: ['movie_genres', 'movie_genres.genre', 'movie_casts', 'movie_casts.actor'] });
    if (!movie) {
      throw new NotFoundException(`Không tìm thấy phim với ID: ${id}`);
    }
    return movie;
  }

  // Xử lý tên
  private normalizeNames(names: string[] | undefined): string[] {
    if (!Array.isArray(names)) {
      return [];
    }

    return [...new Set(names.map((name) => name?.trim()).filter(Boolean))];
  }

  // lấy thể loại phim
  async getAllGenre(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  // Map data movie
  private mapToMovieItem(movie: Movie): MovieItemDto {
    return {
      id: movie.id,
      title: movie.title,
      duration_minutes: movie.duration_minutes,
      genre: movie.movie_genres?.map((mg) => mg.genre?.name) || [],
      status: movie.status,
      age_rating: movie.age_rating ?? null,
      poster_url: movie.poster_url || '',
      trailer_url: movie.trailer_url ?? null,
      actor: movie.movie_casts?.map((mc) => mc.actor?.name) || [],
      start_date: movie.start_date ? new Date(movie.start_date) : null,
    }
  }

  // lấy phim đang chiếu
  async getShowingMovies(): Promise<GetShowingMoviesResponseDto> {
    const movies = await this.movieRepository.find({
      where: { status: MovieStatus.NOW_SHOWING },
      relations: ['movie_genres', 'movie_genres.genre'],
    });

    return {
      success: true,
      data: {
        message: 'Lấy phim đang chiếu thành công',
        movies: movies.map((movie) => this.mapToMovieItem(movie))
      },
    };
  }

  // phim sắp chiếu
  async getComingSoonMovies(): Promise<GetShowingMoviesResponseDto> {
    const movies = await this.movieRepository.find({
      where: { status: MovieStatus.COMING_SOON },
      relations: ['movie_genres', 'movie_genres.genre'],
    });

    return {
      success: true,
      data: {
        message: 'Lấy phim sắp chiếu thành công',
        movies: movies.map((movie)=> this.mapToMovieItem(movie))
      },
    };
  }

  // tạo phim
  async createFilm(dto: CreateMovieDto): Promise<CreateMovieResponseDto> {
    try {
      const title = dto.title.trim();
      const genreNames = this.normalizeNames(dto.genre);
      const actorNames = this.normalizeNames(dto.actor);

      const existingMovies = await this.findMovieByTitle(title);
      if (existingMovies.length > 0) {
        throw new HttpException('Phim đã tồn tại', 400);
      }

      const savedMovie = await this.dataSource.transaction(async (manager) => {
        const movieRepository = manager.getRepository(Movie);
        const genreRepository = manager.getRepository(Genre);
        const actorRepository = manager.getRepository(Actor);
        const movieGenreRepository = manager.getRepository(MovieGenre);
        const movieCastRepository = manager.getRepository(MovieCast);

        const movie = await movieRepository.save(
          movieRepository.create({
            title,
            description: dto.description,
            duration_minutes: dto.duration_minutes,
            poster_url: dto.poster_url,
            trailer_url: dto.trailer_url,
            director: dto.director,
            start_date: dto.start_date,
            end_date: dto.end_date,
            age_rating: dto.age_rating as Movie['age_rating'],
            status: dto.status as MovieStatus,
          }),
        );
        const genres =
          genreNames.length > 0
            ? await genreRepository.find({
              where: { name: In(genreNames) },
            })
            : [];

        const missingGenres = genreNames.filter(
          (name) => !genres.some((genre) => genre.name === name),
        );

        if (missingGenres.length > 0) {

          throw new HttpException(`Không tìm thấy thể loại: ${missingGenres.join(', ')}`, 400);
        }

        if (genres.length > 0) {
          await movieGenreRepository.insert(
            genres.map((genre) => ({
              movie_id: movie.id,
              genre_id: genre.id,
            })),
          );
        }

        const existingActors =
          actorNames.length > 0
            ? await actorRepository.find({
              where: { name: In(actorNames) },
            })
            : [];

        const missingActorNames = actorNames.filter(
          (name) => !existingActors.some((actor) => actor.name === name),
        );

        if (missingActorNames.length > 0) {
          await actorRepository.insert(
            missingActorNames.map((name) => ({
              name,
            })),
          );
        }

        const actors =
          actorNames.length > 0
            ? await actorRepository.find({
              where: { name: In(actorNames) },
            })
            : [];

        if (actors.length > 0) {
          await movieCastRepository.insert(
            actors.map((actor) => ({
              movie_id: movie.id,
              actor_id: actor.id,
            })),
          );
        }

        return {
          movie,
          genres: genres.map((genre) => genre.name),
          actors: actorNames,
        };
      });

      return {
        success: true,
        data: {
          message: 'Tạo phim thành công',
          movie: {
            id: savedMovie.movie.id,
            title: savedMovie.movie.title,
            description: savedMovie.movie.description || '',
            duration_minutes: savedMovie.movie.duration_minutes,
            genre: savedMovie.genres,
            status: savedMovie.movie.status,
            age_rating: savedMovie.movie.age_rating || 'P',
            poster_url: savedMovie.movie.poster_url || '',
            trailer_url: savedMovie.movie.trailer_url || '',
            director: savedMovie.movie.director || '',
            actor: savedMovie.actors,
            start_date: new Date(savedMovie.movie.start_date || new Date()),
            end_date: new Date(savedMovie.movie.end_date || new Date()),
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(`Tạo phim thất bại: ${error.message}`, 500);
    }
  }

  // cập nhật thông tin phim
  async updateMovies(id: string, dto: UpdateMovieDto) : Promise<UpdateMovieResponseDto>{
    try {
      const {genre, actors, ...movieData} = dto;
      await this.dataSource.transaction(async (manager) => {
        const movieRepository = manager.getRepository(Movie);
        const genreRepository = manager.getRepository(Genre);
        const actorRepository = manager.getRepository(Actor);
        const movieGenreRepository = manager.getRepository(MovieGenre);
        const movieCastRepository = manager.getRepository(MovieCast);

        if(Object.keys(movieData).length > 0){
          await movieRepository.update(id, movieData);
        }
        
        // Cập nhật thể loại
        if(genre){
          const genreNames = this.normalizeNames(genre);
          const genres = await genreRepository.find({where: {name: In(genreNames)}});
          const missingGenres = genreNames.filter((name) => !genres.some((genre) => genre.name === name));
          if(missingGenres.length > 0){
            throw new BadRequestException(`Không tìm thấy thể loại: ${missingGenres.join(', ')}`);
          }
          await movieGenreRepository.delete({movie_id: id});
          await movieGenreRepository.insert(
            genres.map((genre) => ({
              movie_id: id,
              genre_id: genre.id,
            })),
          );
        }

        // Cập nhật diễn viên
        if(actors){
          const actorNames = this.normalizeNames(actors);
          const existingActors = await actorRepository.find({where: {name: In(actorNames)}});
          const missingActors = actorNames.filter((name) => !existingActors.some((actor) => actor.name === name));
          if(missingActors.length > 0){
            await actorRepository.insert(
              missingActors.map((name) => ({
                name,
              })),
            );
          }
          const allActors = await actorRepository.find({where: {name: In(actorNames)}});
          await movieCastRepository.delete({movie_id: id});
          if(allActors.length > 0){
            await movieCastRepository.insert(
              allActors.map((actor) => ({
                movie_id: id,
                actor_id: actor.id,
              })),
            );
          }
        }
      })

      const result = await this.findMovieById(id);
      if(!result){
        throw new NotFoundException('Không tìm thấy phim');
      }
      return {
        success: true,
        data: {
          message: 'Cập nhật phim thành công',
          movie: this.mapToMovieItem(result),
        },
      };
    } catch (error) {
      if(error instanceof HttpException){
        throw error;
      }
      throw new InternalServerErrorException(`Cập nhật phim thất bại: ${error.message}`);
    }
  }


  // xoá phim (xoá mềm)
  async deleteMovie(id: string) : Promise<DeleteMovieResponseDto>{
    try {
      const movie = await this.findMovieById(id);
      if(!movie) throw new NotFoundException('Không tìm thấy phim');
      await this.movieRepository.update(id, {status: MovieStatus.ENDED});
      return {
        success: true,
        data: {
          message: 'Xoá phim thành công',
        },
      };
    } catch (error) {
      if(error instanceof HttpException){
        throw error;
      }
      throw new InternalServerErrorException(`Xoá phim thất bại: ${error.message}`);
    }
  }

  // lấy chi tiết phim
  async getMovieById(id: string): Promise<DetailMovieResponseDto> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: [
        'movie_genres',
        'movie_genres.genre',
        'movie_casts',
        'movie_casts.actor',
      ],
    });

    if (!movie) {
      throw new NotFoundException('Không tìm thấy phim');
    }

    return {
      success: true,
      data: {
        id: movie.id,
        title: movie.title,
        description: movie.description || '',
        duration_minutes: movie.duration_minutes,
        poster_url: movie.poster_url || '',
        trailer_url: movie.trailer_url || '',
        director: movie.director || '',
        age_rating: movie.age_rating || 'P',
        status: movie.status,
        start_date: movie.start_date ? new Date(movie.start_date) : new Date(),
        end_date: movie.end_date ? new Date(movie.end_date) : new Date(),
        genre: movie.movie_genres?.map((movieGenre) => movieGenre.genre?.name) || [],
        actor: movie.movie_casts?.map((movieCast) => movieCast.actor?.name) || [],
      },
    };
  }

  // Lấy tất cả các phim 
  async getAllMovies(): Promise<GetAllMovieResponseDto> {
    const movies = await this.movieRepository.find({
      relations: ['movie_genres', 'movie_genres.genre', 'movie_casts', 'movie_casts.actor']
    })
    return {
      success: true,
      data: {
        message: 'Lấy tất cả các phim thành công',
        movies: movies.map((movie) => this.mapToMovieItem(movie))
      }
    }
  }

  

}
