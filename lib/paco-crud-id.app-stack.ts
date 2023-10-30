//import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { Construct } from 'constructs';
import * as cdkc from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
//import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from '@aws-cdk/aws-lambda';
//import { Construct } from 'constructs';
//import * as lambda from 'aws-cdk-lib/aws-lambda'
//import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import {HttpMethod} from '@aws-cdk/aws-apigatewayv2';
import {HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations";

export class PacoCrudIdAppStack extends cdkc.Stack {
  constructor(scope:  cdkc.App, id: string, props?: cdkc.StackProps) {
    super(scope, id, props);

    //crate a dynamodb table
    const table = new dynamodb.Table(this, 'SimpleCrudApiTable', {
      tableName: 'paco-cdk-crud-callerid',
      partitionKey: {name: 'phoneNum', type: dynamodb.AttributeType.STRING},
      removalPolicy: cdkc.RemovalPolicy.DESTROY
    })

    //create a lambda function
    const fn = new lambda.Function(this, 'pacoCdkCrudFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      functionName: 'pacoCdkCrudFunction'
    })
    
  

    //give dynamodb read write permission to lambda function
    table.grantReadWriteData(fn);

    //create an http api gateway
     const api =  new apigw.HttpApi(this, 'pacoCdkCrudCallerIdApi', {
      apiName: 'paco-cdk-crud-callerid-api'
    })
    
  
    //create lambda proxy
    const lambdaProxy = new HttpLambdaIntegration("idintegration",fn)

    //add routes for all paths and methods
    api.addRoutes({
      path: '/items',
      methods: [HttpMethod.GET],
      integration: lambdaProxy
    });

    api.addRoutes({
      path: '/items/{phonenum}',
      methods: [HttpMethod.GET],
      integration: lambdaProxy
    });

    api.addRoutes({
      path: '/items',
      methods: [HttpMethod.PUT],
      integration: lambdaProxy
    });

    api.addRoutes({
      path: '/items/{phonenum}',
      methods: [HttpMethod.DELETE],
      integration: lambdaProxy
    });

    new cdkc.CfnOutput(this, 'APIGatewayEndpoint', {
      exportName: 'APIGatewayEndpoint',
      value: api.apiEndpoint,
      description: 'The endpoint url of the API Gateway'
    });
  }
}
