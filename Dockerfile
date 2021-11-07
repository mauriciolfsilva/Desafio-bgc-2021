FROM public.ecr.aws/lambda/nodejs:14
COPY handler/webscrap/* package*.json
RUN npm install
CMD [ "controller.handler" ]