import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Loop extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Loop.Types.ClientConfiguration)
  config: Config & Loop.Types.ClientConfiguration;
  /**
   *  Suspends loop by robot's friendlyId 
   */
  suspendRobotLoop(params: Loop.Types.SuspendRobotLoopRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   *  Suspends loop by robot's friendlyId 
   */
  suspendRobotLoop(callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   *  Invites new member to loop. 
   */
  inviteMember(params: Loop.Types.InviteRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Invites new member to loop. 
   */
  inviteMember(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Accepts invitation. 
   */
  acceptInvitation(params: Loop.Types.LoopIdRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Accepts invitation. 
   */
  acceptInvitation(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Declines invitation. 
   */
  declineInvitation(params: Loop.Types.LoopIdRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Declines invitation. 
   */
  declineInvitation(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  List members and their membership status. Doesn't include Crew-only members. 
   */
  listMembers(params: Loop.Types.ListMembersRequest, callback?: (err: AWSError, data: Loop.Types.MemberList) => void): Request<Loop.Types.MemberList, AWSError>;
  /**
   *  List members and their membership status. Doesn't include Crew-only members. 
   */
  listMembers(callback?: (err: AWSError, data: Loop.Types.MemberList) => void): Request<Loop.Types.MemberList, AWSError>;
  /**
   *  Updates member. 
   */
  updateMember(params: Loop.Types.UpdateMemberRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Updates member. 
   */
  updateMember(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Mark member as removed from the loop. 
   */
  removeMember(params: Loop.Types.RemoveMemberRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Mark member as removed from the loop. 
   */
  removeMember(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Lists robots in loops user owns. 
   */
  listOwnerRobots(params: Loop.Types.AccountIdRequest, callback?: (err: AWSError, data: Loop.Types.RobotIdList) => void): Request<Loop.Types.RobotIdList, AWSError>;
  /**
   *  Lists robots in loops user owns. 
   */
  listOwnerRobots(callback?: (err: AWSError, data: Loop.Types.RobotIdList) => void): Request<Loop.Types.RobotIdList, AWSError>;
  /**
   *  Removes loop associated with robot.    Can only be called by manufacturing account  
   */
  clearRobot(params: Loop.Types.RobotIdRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Removes loop associated with robot.    Can only be called by manufacturing account  
   */
  clearRobot(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Retrieves robot credentials for specified loop. 
   */
  getRobot(params: Loop.Types.LoopIdRequest, callback?: (err: AWSError, data: Loop.Types.RobotAccount) => void): Request<Loop.Types.RobotAccount, AWSError>;
  /**
   *  Retrieves robot credentials for specified loop. 
   */
  getRobot(callback?: (err: AWSError, data: Loop.Types.RobotAccount) => void): Request<Loop.Types.RobotAccount, AWSError>;
  /**
   *  Creates loop. 
   */
  create(params: Loop.Types.CreateLoopRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Creates loop. 
   */
  create(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Updates loop. 
   */
  update(params: Loop.Types.UpdateLoopRequest, callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates loop. 
   */
  update(callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Lists loops for current account. You can request one specific loop by specifying it's id. 
   */
  list(params: Loop.Types.LoopIdRequestOptional, callback?: (err: AWSError, data: Loop.Types.LoopList) => void): Request<Loop.Types.LoopList, AWSError>;
  /**
   *  Lists loops for current account. You can request one specific loop by specifying it's id. 
   */
  list(callback?: (err: AWSError, data: Loop.Types.LoopList) => void): Request<Loop.Types.LoopList, AWSError>;
  /**
   *  Removes loop. 
   */
  remove(params: Loop.Types.LoopIdRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Removes loop. 
   */
  remove(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Sets face and voice enrollment status for a loop member. 
   */
  setEnrollment(params: Loop.Types.SetEnrollmentRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Sets face and voice enrollment status for a loop member. 
   */
  setEnrollment(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Finds loop owner id by id of loop member (owner id or member id). 
   */
  findOwner(params: Loop.Types.AccountIdRequest, callback?: (err: AWSError, data: Loop.Types.AccountId) => void): Request<Loop.Types.AccountId, AWSError>;
  /**
   *  Finds loop owner id by id of loop member (owner id or member id). 
   */
  findOwner(callback?: (err: AWSError, data: Loop.Types.AccountId) => void): Request<Loop.Types.AccountId, AWSError>;
  /**
   *  Set legal guardian for child member and sends out agreement to sign. 
   */
  setLegalGuardian(params: Loop.Types.LegalGuardian, callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Set legal guardian for child member and sends out agreement to sign. 
   */
  setLegalGuardian(callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates current status for agreement. 
   */
  updateAgreementStatus(params: Loop.Types.AgreementRequest, callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates current status for agreement. 
   */
  updateAgreementStatus(callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates nickname for loop member. 
   */
  updateNickname(params: Loop.Types.NicknameRequest, callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates nickname for loop member. 
   */
  updateNickname(callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates phonetic name for loop member. 
   */
  updatePhoneticName(params: Loop.Types.PhoneticNameRequest, callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Updates phonetic name for loop member. 
   */
  updatePhoneticName(callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Puts loop into suspended mode. 
   */
  suspendLoop(params: Loop.Types.LoopIdRequest, callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Puts loop into suspended mode. 
   */
  suspendLoop(callback?: (err: AWSError, data: Loop.Types.CommandResponse) => void): Request<Loop.Types.CommandResponse, AWSError>;
  /**
   *  Adds or updates member photo. 
   */
  updateMemberPhoto(params: Loop.Types.UpdateMemberPhotoRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Adds or updates member photo. 
   */
  updateMemberPhoto(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Removes member photo. 
   */
  removeMemberPhoto(params: Loop.Types.RemoveMemberPhotoRequest, callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
  /**
   *  Removes member photo. 
   */
  removeMemberPhoto(callback?: (err: AWSError, data: Loop.Types.Loop) => void): Request<Loop.Types.Loop, AWSError>;
}
declare namespace Loop {
  export interface SuspendRobotLoopRequest {
    friendlyId: undefined;
  }
  export type Timestamp = number;
  export type MemberId = string;
  export type AccountId = string;
  export interface AccountIdRequest {
    accountId?: AccountId;
  }
  export type LoopId = string;
  export interface LoopIdRequest {
    loopId: LoopId;
  }
  export interface LoopIdRequestOptional {
    loopId?: LoopId;
  }
  export type RobotId = string;
  export interface RobotIdRequest {
    robotId: RobotId;
  }
  export type RobotIdList = RobotId[];
  export type Email = string;
  export type Gender = "male"|"female"|"other"|"they"|string;
  export type InvitationStatus = "invited"|"accepted"|"declined"|"removed"|string;
  export type InvitationStatusList = InvitationStatus[];
  export type InvitationType = "incoming"|"outgoing"|string;
  export type InvitationTypeList = InvitationType[];
  export interface InviteRequest {
    loopId: LoopId;
    email?: Email;
    firstName?: undefined;
    lastName?: undefined;
    gender?: Gender;
    birthday?: undefined;
    asLegalGuardian?: undefined;
    isChild?: undefined;
    phoneNumber?: undefined;
  }
  export interface ListMembersRequest {
    statusList?: InvitationStatusList;
    typeList?: InvitationTypeList;
  }
  export interface RemoveMemberRequest {
    loopId: LoopId;
    id: MemberId;
  }
  export interface UpdateMemberRequest {
    loopId: LoopId;
    id: MemberId;
    email?: Email;
    firstName?: undefined;
    lastName?: undefined;
    gender?: Gender;
    birthday?: undefined;
    isChild?: undefined;
    phoneNumber?: undefined;
  }
  export interface SetEnrollmentRequest {
    loopId: LoopId;
    id: MemberId;
    face?: undefined;
    voice?: undefined;
  }
  export interface Enrolled {
    face?: undefined;
    voice?: undefined;
  }
  export type FacebookToken = string;
  export interface MemberAccount {
    email?: Email;
    firstName?: undefined;
    lastName?: undefined;
    gender?: Gender;
    birthday?: undefined;
    photoUrl?: undefined;
    facebookAccessToken?: FacebookToken;
    isChild?: undefined;
    phoneNumber?: undefined;
    messagingAllowed?: undefined;
  }
  export type AgreementId = string;
  export interface Member {
    id: MemberId;
    loopId: LoopId;
    accountId?: AccountId;
    account?: MemberAccount;
    enrolled?: Enrolled;
    status: InvitationStatus;
    type: InvitationType;
    agreementId?: AgreementId;
    nickname?: Nickname;
    phoneticName?: PhoneticName;
    legalGuardianId?: MemberId;
    created?: Timestamp;
  }
  export type MemberList = Member[];
  export interface Loop {
    id?: LoopId;
    name?: undefined;
    owner: AccountId;
    robot?: AccountId;
    robotFriendlyId?: RobotId;
    members?: MemberList;
    isSuspended?: undefined;
    created?: Timestamp;
    updated?: Timestamp;
  }
  export type LoopList = Loop[];
  export interface CreateLoopRequest {
    robotId: undefined;
    name: undefined;
  }
  export interface UpdateLoopRequest {
    loopId: LoopId;
    name: undefined;
  }
  export interface RobotAccount {
    accessKeyId: undefined;
    secretAccessKey: undefined;
    friendlyId: RobotId;
  }
  export interface CommandResponse {
    result: undefined;
  }
  export interface LegalGuardian {
    loopId: LoopId;
    childId: MemberId;
    parentId: MemberId;
  }
  export interface AgreementRequest {
    agreementId: AgreementId;
  }
  export type Nickname = string;
  export interface NicknameRequest {
    loopId: LoopId;
    id: MemberId;
    nickname?: Nickname;
  }
  export type PhoneticName = string;
  export interface PhoneticNameRequest {
    loopId: LoopId;
    id: MemberId;
    phoneticName?: PhoneticName;
  }
  export type Stream = Buffer|Uint8Array|Blob|string;
  export interface UpdateMemberPhotoRequest {
    body?: Stream;
    loopId: LoopId;
    id: MemberId;
  }
  export interface RemoveMemberPhotoRequest {
    loopId: LoopId;
    id: MemberId;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-03-24"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Loop client.
   */
  export import Types = Loop;
}
export = Loop;
