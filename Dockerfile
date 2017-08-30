FROM python:3.6-alpine
RUN apk add --no-cache gcc g++ make libffi-dev openssl-dev python3-dev build-base && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pycrypto>=2.6.1 flask>=0.12.2 && \
    apk del --purge gcc g++ make libffi-dev openssl-dev python3-dev build-base && \
    rm -r /root/.cache
COPY ./server/requirements.txt /app/
WORKDIR /app
RUN pip3 install -r requirements.txt
COPY ./server /app/server
COPY ./dist /app/dist

ENTRYPOINT ["python3"]
CMD ["/app/server/run.py"]

EXPOSE 5000