import { getRepository, Repository } from "typeorm";
import { ActivityType, event } from "../../utils/activity.helper";
import logger from "../../config/logger";
import Dao from "../../interfaces/dao.interface";
import SearchResult from "../../interfaces/searchresult.interface";
import RecordNotFoundException from "../../exceptions/RecordNotFoundException";
import RecordsNotFoundException from "../../exceptions/RecordsNotFoundException";
import UserNotAuthorizedException from "../../exceptions/UserNotAuthorizedException";
import { AuthPermission, getPermission } from "../../utils/authorization.helper";

import { User } from "../user/user.entity";
import { Goal } from "./goal.entity";
import CreateGoalDto from "./goal.dto";

/**
 * Handles CRUD operations on Goal data in database
 * Factoring to this class allows other (i.e. GraphQL to reuse this code in resolvers)
 */
class GoalDao implements Dao {
  private resource: string = "goal"; // matches defined goal goal "resource"
  private goalRepository: Repository<Goal> = getRepository(Goal);

  constructor() {
    // nothing
  }

  public getAll = async (user: User, params?: {[key: string]: any}):
            Promise<SearchResult> => {
    const started: number = Date.now();
    const records = await this.goalRepository.find({ relations: ["flags"] });

    const isOwnerOrMember: boolean = false;
    const action: string = ActivityType.READ;
    const permission: AuthPermission = await getPermission(user, isOwnerOrMember, action, this.resource);

    if (permission.granted) {
      if (!records) {
        throw new RecordsNotFoundException(this.resource);
      } else {
        // log event to central handler
        const ended: number = Date.now();
        event.emit(action, {
          actor: user,
          object: null,
          resource: this.resource,
          timestamp: ended,
          took: ended - started,
          type: action,
        });

        return {
          data: permission.filter(records),
          length: records.length,
          total: records.length,
        };
      }
    } else {
      throw new UserNotAuthorizedException(user.id, action, this.resource);
    }
  }

  public getOne = async (user: User, id: string):
            Promise<Goal | RecordNotFoundException | UserNotAuthorizedException> => {
    const started: number = Date.now();
    logger.info(`Fetching ${this.resource} with ID ${id}`);
    const record = await this.goalRepository.findOne(id, { relations: ["flags"] });

    const isOwnerOrMember: boolean = false;
    const action: string = ActivityType.READ;
    const permission: AuthPermission = await getPermission(user, isOwnerOrMember, action, this.resource);

    if (permission.granted) {
      if (!record) {
        throw new RecordNotFoundException(id);
      } else {
        // log event to central handler
        const ended: number = Date.now();
        event.emit(action, {
          actor: user,
          object: {id: record.id},
          resource: this.resource,
          timestamp: ended,
          took: ended - started,
          type: action,
        });

        return permission.filter(record);
      }
    } else {
      throw new UserNotAuthorizedException(user.id, action, this.resource);
    }
  }

  public save = async (user: User, data: any):
            Promise<Goal | RecordNotFoundException | UserNotAuthorizedException> => {
    const started: number = Date.now();
    const newRecord: CreateGoalDto = data;

    const isOwnerOrMember: boolean = false;
    const action: string = ActivityType.CREATE;
    const permission: AuthPermission = await getPermission(user, isOwnerOrMember, action, this.resource);

    if (permission.granted) {
      const filteredData: Goal = permission.filter(newRecord);
      await this.goalRepository.save(filteredData);

      // log event to central handler
      const ended: number = Date.now();
      event.emit(action, {
        actor: user,
        object: filteredData,
        resource: this.resource,
        timestamp: ended,
        took: ended - started,
        type: action,
      });

      logger.info(`Saved ${this.resource} with ID ${filteredData.id} in the database`);
      return filteredData;
    } else {
      throw new UserNotAuthorizedException(user.id, action, this.resource);
    }
  }

  public remove = async (user: User, id: string):
            Promise<boolean | RecordNotFoundException | UserNotAuthorizedException> => {
    const started: number = Date.now();
    const recordToRemove = await this.goalRepository.findOne(id);

    const isOwnerOrMember: boolean = false;
    const action: string = ActivityType.DELETE;
    const permission: AuthPermission = await getPermission(user, isOwnerOrMember, action, this.resource);

    if (permission.granted) {
      if (recordToRemove) {
        recordToRemove.enabled = false;
        await this.goalRepository.save(recordToRemove);

        // log event to central handler
        const ended: number = Date.now();
        event.emit(action, {
          actor: user,
          object: {id},
          resource: this.resource,
          timestamp: ended,
          took: ended - started,
          type: action,
        });

        logger.info(`Removed ${this.resource} with ID ${id} from the database`);
        return true;
      } else {
        throw new RecordNotFoundException(id);
      }
    } else {
      throw new UserNotAuthorizedException(user.id, action, this.resource);
    }
  }

}

export default GoalDao;
