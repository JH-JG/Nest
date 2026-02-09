import { Injectable, NotFoundException } from '@nestjs/common';
import { createMovieDto } from './dto/create-movie.dto';
import { updateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';


@Injectable()
export class MovieService {
  private movies: Movie[] = [];
  //   {
  //     id: 1,
  //     title: '해리포터',
  //     genre: 'fantasy'
  //   },
  //   {
  //     id: 2,
  //     title: '반지의 제왕',
  //     genre: 'action'
  //   }

  // ];
  private idCounter: number = 3;

  constructor(){
    const movie1 = new Movie();

    movie1.id = 1;
    movie1.title = '해리포터';
    movie1.genre = 'fantasy';

    const movie2 = new Movie();

    movie2.id = 2;
    movie2.title = '반지의 제왕';
    movie2.genre = 'action';

    this.movies.push(movie1, movie2)
  }

  
  getManyMovies(title?: string){
    console.log(this.movies) // Exclude하더라도 실제 값은 들어오고 있다, 보이지 않음

    if(!title){
      return this.movies;
    }
    return this.movies.filter(m=>m.title.startsWith(title));
  }


  getMovie(id: number){
    const movie = this.movies.find((m=>m.id === id));
    
        if(!movie) {
          throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
        }
    
        return movie;
  }


  postMovie(createMovieDto: createMovieDto){
    const movie: Movie = {
      id: this.idCounter++,
      ...createMovieDto,
    }

    this.movies.push(movie);

    return movie;
  }


  patchMovie(id: number, updateMovieDto: updateMovieDto){
    // 타입을 지정하지 않아도 자동으로 추론
        const movie = this.movies.find(m=>m.id === id); // 타입 Movie / undefined
    
        if(!movie) {
          throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
        }
    
        // Error 핸들링이 없다면 movie는 타입이 확정되지 않은 상태 (Movie / undefined)
        // 여기부턴 Movie 타입으로 확정됨
        Object.assign(movie, updateMovieDto); // 메모리 주소의 객체를 직접 수정, 현재 movie는 복사본
        
        return movie;
  }


  deleteMovie(id: number){
    const movieIndex = this.movies.findIndex(m=>m.id === id);

    if(movieIndex === -1){
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    this.movies.splice(movieIndex, 1);

    return id;
  }
}
