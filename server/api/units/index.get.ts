import { UnitService } from '../../services/unit.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return await UnitService.getUnits(query);
});

