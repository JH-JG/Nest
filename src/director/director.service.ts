import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ){}

  findAll() {
    return this.directorRepository.find();
  }

  findOne(id: number) {
    return this.directorRepository.findOne({
      where:{
        id,
      }
    });
  }

  create(createDirectorDto: CreateDirectorDto) {
    return this.directorRepository.save(createDirectorDto);
  }


  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorRepository.findOne({
          where: {
            id,
          },
        });
    
        if (!director) {
          throw new NotFoundException('존재하지 않는 ID 값의 감독입니다.');
        }
    
        await this.directorRepository.update(
          { id }, // 첫번째는 조건
          {
          ...updateDirectorDto, // 업데이트 할 값
          }
        );
    
    
        const new_director = await this.directorRepository.findOne({
          where: {
            id,
          }
        });
    
        return new_director;
  }

  async remove(id: number) {
    const director = await this.directorRepository.findOne({
      where:{
        id,
      }
    })

    if (!director){
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    await this.directorRepository.delete(id);
    return id;
  }
}
