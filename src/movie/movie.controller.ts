import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(
    @Query('title') title?: string,
  ) {
    return this.movieService.getManyMovies(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.movieService.getMovie(+id);
  }

  @Post()
  postMovie(@Body('title') title: string) {
    return this.movieService.postMovie(title);
  }

  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.movieService.patchMovie(+id, title);
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    return this.movieService.deleteMovie(+id);
  }
}
