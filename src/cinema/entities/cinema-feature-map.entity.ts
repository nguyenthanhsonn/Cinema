import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cinema } from './cinema.entity';
import { CinemaFeature } from './cinema-feature.entity';

@Entity('cinema_feature_maps')
export class CinemaFeatureMap {
  @PrimaryColumn('uuid')
  cinema_id: string;

  @Index()
  @PrimaryColumn('uuid')
  feature_id: string;

  @ManyToOne(() => Cinema, (cinema) => cinema.cinema_feature_maps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cinema_id' })
  cinema: Cinema;

  @ManyToOne(() => CinemaFeature, (feature) => feature.cinema_feature_maps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'feature_id' })
  feature: CinemaFeature;
}
