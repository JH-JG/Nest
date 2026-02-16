import { Injectable, NotFoundException } from '@nestjs/common';
import { createMovieDto } from './dto/create-movie.dto';
import { updateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';


@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,

    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,

    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    
    private readonly dataSource: DataSource
  ) { }


  async findAll(title?: string) {
    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if(title){
      qb.where('movie.title LIKE :title', {title: `%${title}%`})
    }

    return await qb.getManyAndCount();

    // if (!title) {
    //   return [await this.movieRepository.find({
    //     relations: ['director', 'genres']
    //   }), await this.movieRepository.count()];
    // }

    // return await this.movieRepository.findAndCount({
    //   where: {
    //     title: Like(`%${title}%`)
    //   },
    //   relations: ['director', 'genres']
    // })

    // console.log(this.movies) // Exclude하더라도 실제 값은 들어오고 있다, 보이지 않음

    // if(!title){
    //   return this.movies;
    // }
    // return this.movies.filter(m=>m.title.startsWith(title));
  }


  async findOne(id: number) {
    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .where('movie.id = :id', {id})
      // .getOne();
    return qb.getOne();


    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail', 'director', 'genres']
    // });

    // return movie;
    // const movie = this.movies.find((m=>m.id === id));

    //     if(!movie) {
    //       throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    //     }

    //     return movie;
  }


  async create(createMovieDto: createMovieDto) {
    // const moviedetail = await this.movieDetailRepository.save({
    //   detail: createMovieDto.detail,
    // });

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try{
      const genres = await qr.manager.find(Genre, {
      where: {
        id: In(createMovieDto.genreIds),
      }
    })

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(`존재하지않는 장르가 있습니다. -> ${genres.map(genre => genre.id).join(',')}`);
    }

    const director = await qr.manager.findOne(Director, {
      where: {
        id: createMovieDto.directorId
      }
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 감독입니다.')
    }

    const movieDetail = await qr.manager.createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail
      })
      .execute();
    
    throw new NotFoundException('그냥');

    const movieDetailId = movieDetail.identifiers[0].id

    // 직접 연결 해워야됨, cascade처럼 편하게 자동으로 되지 않음,
    // Many to Many 도 따로 해줘야함
    const movie = await qr.manager.createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: {
          id: movieDetailId,
        },
        director,
        genres
      })
      .execute();

    const movieId = movie.identifiers [0].id;

    await qr.manager.createQueryBuilder()
      .relation (Movie, 'genres')
      .of (movieId)
      .add (genres.map(genre => genre.id));

      qr.commitTransaction();

      // 트랜잭션이 완료된 뒤 수행 즉, 트랜잭션내에서 실행할 필요 없음
      return await this.movieRepository.findOne({
      where:{
        id: movieId
      },
      relations: ['detail', 'director', 'genres']
    });
    }catch(e){

      await qr.rollbackTransaction();
      throw(e);
    }finally{

      await qr.release();
    }

    
    
    // const movie = await this.movieRepository.save({
    //   title: createMovieDto.title,
    //   detail: {
    //     detail: createMovieDto.detail,
    //   },
    //   director,
    //   genres
    // }
    // );

    // return movie;

    // const movie: Movie = {
    //   id: this.idCounter++,
    //   ...createMovieDto,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    //   version: 0,
    // }

    // this.movies.push(movie);

    // return movie;
  }


  async update(id: number, updateMovieDto: updateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres']
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    let new_director;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {
          id: directorId,
        }
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다.')
      }
      new_director = director;
    }

    let new_genres

    if (genreIds){
      const genres = await this.genreRepository.find({
        where: {
          id: In(genreIds)
        }
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(`존재하지않는 장르가 있습니다. -> ${genres.map(genre => genre.id).join(',')}`);
      }
      new_genres = genres
    }
    

    const movieUpdateFields = {
      ...movieRest,
      ...(new_director && { director: new_director })
    }

    await this.movieRepository.update(
      { id }, // 첫번째는 조건
      movieUpdateFields, // 업데이트 할 값
    );

    if (detail) {
      await this.movieDetailRepository.update({
        id: movie.detail.id,
      },
        {
          detail,
        })
    }

    const new_movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director']
    });

    new_movie.genres = new_genres;

    await this.movieRepository.save(new_movie);

    return await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres']
    });

    // // 타입을 지정하지 않아도 자동으로 추론
    //     const movie = this.movies.find(m=>m.id === id); // 타입 Movie / undefined

    //     if(!movie) {
    //       throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    //     }

    //     // Error 핸들링이 없다면 movie는 타입이 확정되지 않은 상태 (Movie / undefined)
    //     // 여기부턴 Movie 타입으로 확정됨
    //     Object.assign(movie, updateMovieDto); // 메모리 주소의 객체를 직접 수정, 현재 movie는 복사본

    //     return movie;
  }


  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id
      },
      relations: ['detail']
    }
    );

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;

    // const movieIndex = this.movies.findIndex(m=>m.id === id);

    // if(movieIndex === -1){
    //   throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    // }

    // this.movies.splice(movieIndex, 1);

    // return id;
  }
}
