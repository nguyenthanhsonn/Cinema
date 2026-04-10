import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CinemaFeatureMap } from './cinema-feature-map.entity';

@Entity('cinema_features')
export class CinemaFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => CinemaFeatureMap, (featureMap) => featureMap.feature)
  cinema_feature_maps: CinemaFeatureMap[];
}
