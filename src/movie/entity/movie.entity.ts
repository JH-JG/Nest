import { Exclude, Expose, Transform } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import { BaseTable } from "../../common/entity/base-table.entity";
import { MovieDetail } from "./movie-detail.entity";
import { Director } from "src/director/entity/director.entity";
import { Genre } from "src/genre/entity/genre.entity";

// ManyToOne    Director -> 감독은 여러개의 영화를 만들 수 있음
// OneToOne     MovieDetail -> 영화는 하나의 상세 내용을 가질 수 있음
// ManyToMany   Genre -> 영화는 여러개의 장르를 가질 수 있고 장르도 여러 영화를 가질 수 있음

// @Exclude() // 외부에 노출되지 않게하기 위함
@Entity()
export class Movie extends BaseTable {
    // @Expose() // class 전체를 Exclude로 노출되지 않게 하고 Expose하면 보여도 되느 값을 보이게끔 함
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    title: string;

    @ManyToMany(
        ()=>Genre,
        genre=>genre.movies,
    )
    @JoinTable()
    genres: Genre[];

    @OneToOne(
        () => MovieDetail,
        movieDetail => movieDetail.id,
        {
            cascade: true,
            nullable: false
        }
    )
    @JoinColumn()
    detail: MovieDetail;

    @ManyToOne(
        ()=>Director,
        director=>director.id,
        {
            cascade: true,
            nullable: false
        }
    )
    director: Director

    // // Entity Embedding 실제로 찍어보면 객체가 통째로 들어감
    // @Column(
    //     () => BaseEntity
    // )
    // base: BaseEntity;
}