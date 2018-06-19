// Copyright 2018 Ryan Dahl <ry@tinyclouds.org>
// All rights reserved. MIT License.

export interface CodePos {
  start: number;
  end: number;
}

export interface TypeRef {
  file: string;
  name: string;
}

export enum ParameterType {
  PUBLIC,
  PRIVATE,
  PROTECTED
}

export interface ClassMemberParameter {
  type: TypeRef;
  // documentation: string; ?
  name: string;
}

export interface ClassMember {
  type: ParameterType;
  documentation: string;
  optional: boolean;
  readonly: boolean;
  parameters: ClassMemberParameter;
}

export interface ClassDocumentation {
  type: "class";
  documentation: string;
  name: string;
  pos: CodePos;
  members: ClassMember[];
}

export type DocEntry = ClassDocumentation;
