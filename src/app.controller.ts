import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

interface Movie {
  id: number;
  title: string;
}

@Controller('movie')
export class AppController {
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

  constructor(private readonly appService: AppService) { }

  @Get()
  getMovies(
    @Query('title') title?: string,
  ) {
    if(!title){
      return this.movies;
    }
    return this.movies.filter(m=>m.title.startsWith(title));
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    const movie = this.movies.find((m=>m.id === +id));

    if(!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    return movie;
  }

  @Post()
  postMovie(@Body('title') title: string) {
    const movie: Movie = {
      id: this.idCounter++,
      title: title
    }

    this.movies.push(movie);

    return movie;
  }

  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    // 타입을 지정하지 않아도 자동으로 추론
    const movie = this.movies.find(m=>m.id === +id); // 타입 Movie / undefined

    if(!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    // Error 핸들링이 없다면 movie는 타입이 확정되지 않은 상태 (Movie / undefined)
    // 여기부턴 Movie 타입으로 확정됨
    Object.assign(movie, {title}); // 메모리 주소의 객체를 직접 수정, 현재 movie는 복사본
    
    return movie;
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    const movieIndex = this.movies.findIndex(m=>m.id === +id);

    if(movieIndex === -1){
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    this.movies.splice(movieIndex, 1);

    return id;
  }
}
