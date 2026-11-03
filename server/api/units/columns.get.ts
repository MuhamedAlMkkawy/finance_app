import { UnitService } from '../../services/unit.service';

export default defineEventHandler(() => {
  return UnitService.getColumnMetadata();
});

