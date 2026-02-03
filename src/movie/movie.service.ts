import { Injectable, NotFoundException } from '@nestjs/common';

export interface Movie {
  id: number;
  title: string;
}

@Injectable()
export class MovieService {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의 제왕',
    }

  ];
  private idCounter: number = 3;
  
  getManyMovies(title?: string){
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


  postMovie(title: string){
    const movie: Movie = {
      id: this.idCounter++,
      title: title
    }

    this.movies.push(movie);

    return movie;
  }


  patchMovie(id: number, title: string){
    // 타입을 지정하지 않아도 자동으로 추론
        const movie = this.movies.find(m=>m.id === id); // 타입 Movie / undefined
    
        if(!movie) {
          throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
        }
    
        // Error 핸들링이 없다면 movie는 타입이 확정되지 않은 상태 (Movie / undefined)
        // 여기부턴 Movie 타입으로 확정됨
        Object.assign(movie, {title}); // 메모리 주소의 객체를 직접 수정, 현재 movie는 복사본
        
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
