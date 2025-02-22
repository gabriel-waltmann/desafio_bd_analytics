import { User } from "@/database/entity/UserEntiy"
import { Repository } from "typeorm"

interface UserCreateDTO {
  repository: Repository<User>,
  params: {
    name: string,
    email: string,
    role: string,
    isOnboarded: boolean
  }
}
export const create = async (props: UserCreateDTO): Promise<User> => {
  const { repository } = props;

  const user = repository.create(props.params);

  return await repository.save(user);
}

interface UserRetrieveDTO {
  repository: Repository<User>,
  params: {
    email?: string
    id?: number
  }
}
export const retrieve = async (props: UserRetrieveDTO): Promise<User> => {
  const { repository } = props;

  if (props.params.id) return await repository.findOne({ where: { id: props.params.id } });

  return await repository.findOne({ where: { email: props.params.email } });
}

interface UserRetrievesDTO {
  repository: Repository<User>,
}
export const retrieves = async (props: UserRetrievesDTO): Promise<User[]> => {
  const { repository } = props;

  return await repository.find();
}

interface UserUpdateDTO {
  repository: Repository<User>,
  params: {
    id: number,
    email: string,
    name: string,
    role: string,
    isOnboarded: boolean
  }
}
export const update = async (props: UserUpdateDTO): Promise<User> => {
  const { repository } = props;

  return await repository.save(props.params);
}

interface UserDeleteDTO {
  repository: Repository<User>,
  params: {
    email: string
  }
}
export const remove = async (props: UserDeleteDTO): Promise<User> => {
  const { repository } = props;

  return await repository.remove(await repository.findOne({ where: { email: props.params.email } }));
}