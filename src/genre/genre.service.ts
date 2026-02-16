import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entity/genre.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>
  ){}
  
  create(createGenreDto: CreateGenreDto) {
    return this.genreRepository.save(createGenreDto);
  }

  findAll() {
    return this.genreRepository.find();
  }

  findOne(id: number) {
    return this.genreRepository.findOne({
      where:{
        id
      }
    });
  }

  // TypeOrm은 객체를 받도록 설계되어 있음, { id }는 객체를 생성해서 파라미터를 전달, id는 단순 파라미터 전달
  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepository.findOne({
      where:{
        id
      }
    });

    if(!genre){
      throw new NotFoundException('존재하지 않는 장르')
    }

    await this.genreRepository.update({
      id,
    },{
      ...updateGenreDto
    }
  );

  const new_genre = await this.genreRepository.findOne({
    where:{
      id
    }
  });

  return new_genre;
  }

  async remove(id: number) {
    const genre = await this.genreRepository.findOne({
      where:{
        id
      }
    });

    if(!genre){
      throw new NotFoundException('존재하지 않는 장르')
    }
    
    await this.genreRepository.delete(id);

    return id;
  }
}
