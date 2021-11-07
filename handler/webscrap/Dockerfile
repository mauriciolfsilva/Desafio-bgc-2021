FROM public.ecr.aws/lambda/nodejs:14
ENV HOME=/var/task/lambda
RUN mkdir -p $HOME
COPY . $HOME
WORKDIR $HOME
RUN npm install
CMD [ "controller.handler" ]
EXPOSE 3000
