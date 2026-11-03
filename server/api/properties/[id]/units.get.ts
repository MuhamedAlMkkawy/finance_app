import { UnitService } from '../../../services/unit.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);

  return await UnitService.getUnits({
    ...query,
    property: id
  });
});

