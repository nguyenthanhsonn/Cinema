import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/resquest/create-movie.dto';
// import { UpdateMovieDto } from './dto/update-movie.dto';
import { Actor } from './entities/actor.entity';
import { Genre } from './entities/genre.entity';
import { MovieCast } from './entities/movie-cast.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { Movie } from './entities/movie.entity';
import { Review } from './entities/review.entity';
import { GetShowingMoviesResponseDto } from './dto/response/get-movie-response.dto';
import { MovieStatus } from './enums/movie.enum';
import { CreateMovieResponseDto } from './dto/response/create-movie-response.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(MovieGenre)
    private readonly movieGenreRepository: Repository<MovieGenre>,
    @InjectRepository(MovieCast)
    private readonly movieCastRepository: Repository<MovieCast>,
    private readonly dataSource: DataSource,
  ) { }

  private findMovieByTitle(title: string): Promise<Movie[]> {
    return this.movieRepository.find({ where: { title } });
  }
  // Lấy tất cả thể loại
  async getAllGenre(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  //Lấy phim đang chiếu
  async getShowingMovies(): Promise<GetShowingMoviesResponseDto> {
    const movies = await this.movieRepository.find({
      where: { status: MovieStatus.NOW_SHOWING },
      relations: ['movie_genres', 'movie_genres.genre']
    });

    return {
      success: true,
      data: {
        message: 'Lấy phim đang chiếu thành công',
        movies: movies.map(movie => ({
          id: movie.id, // id của phim
          title: movie.title, // tên phim
          duration_minutes: movie.duration_minutes, // thời lượng phim
          genre: movie.movie_genres?.map(mg => mg.genre?.name) || [], // thể loại phim
          status: movie.status as string, // trạng thái phim
          age_rating: movie.age_rating ? (movie.age_rating as string) : 'P', // độ tuổi phù hợp
          poster_url: movie.poster_url || '', // ảnh bìa phim
          start_date: movie.start_date ? new Date(movie.start_date) : new Date() // ngày bắt đầu chiếu
        }))
      }
    };
  }


  // tạo phim
  async createFilm(dto: CreateMovieDto): Promise<CreateMovieResponseDto> {
    try {
      const find_film = await this.findMovieByTitle(dto.title);
      if (find_film.length > 0) {
        throw new HttpException('Phim đã tồn tại', 400);
      }

      // tạo và lưu phim
      const savedMovie = await this.dataSource.transaction(async (manager) => {
        const movieResult = await manager
          .createQueryBuilder() // tạo query builder
          .insert()
          .into('movies') // tên bảng trong database
          .values({
            title: dto.title,
            description: dto.description,
            duration_minutes: dto.duration_minutes,
            poster_url: dto.poster_url,
            trailer_url: dto.trailer_url,
            director: dto.director,
            start_date: dto.start_date,
            end_date: dto.end_date,
            age_rating: dto.age_rating,
            status: dto.status
          })
          .returning('id') // trả về id của phim vừa tạo
          .execute(); // thực thi query

          // lấy id của phim vừa tạo
          const movieId = movieResult.raw[0].id;


          // insert movie_genres
          const genres = await manager
          .createQueryBuilder()
          .select('g.id', 'id') // lấy id của thể loại
          .from('genres', 'g') // tên bảng
          .where('g.name IN (:...names)', {names: dto.genre}) // điều kiện tìm kiếm thể loại theo tên 
          .getRawMany();

          if(genres.length > 0){
            await manager
                  .createQueryBuilder()
                  .insert()
                  .into('movie_genres')
                  .values(
                    genres.map(g => ({
                      movie_id: movieId,
                      genre_id: g.id
                    }))
                  )
                  .execute();
          }

          // insert movie_casts
          const movie_casts = await manager
                .createQueryBuilder()
                .insert()
                .into('movie_casts')
                .values(
                  dto.actor.map(actor => )
                )
      }
      
      
      
      
      

      return {
        success: true,
        data: {
          message: 'Tạo phim thành công',
          movie: {
            id: savedMovie.id,
            title: savedMovie.title,
            description: savedMovie.description || '',
            duration_minutes: savedMovie.duration_minutes,
            genre: genre || [],
            status: savedMovie.status,
            age_rating: savedMovie.age_rating || 'P',
            poster_url: savedMovie.poster_url || '',
            trailer_url: savedMovie.trailer_url || '',
            director: savedMovie.director || '',
            actor: actor || [],
            start_date: new Date(savedMovie.start_date || new Date()),
            end_date: new Date(savedMovie.end_date || new Date())
          }
        }
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Tạo phim thất bại: ' + error.message, 500);
    }
  }
}
