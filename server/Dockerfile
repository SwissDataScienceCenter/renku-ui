FROM python:3.6-alpine
RUN apk add --no-cache gcc g++ make libffi-dev openssl-dev python3-dev build-base && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pycrypto>=2.6.1 flask>=0.12.2 && \
    apk del --purge gcc g++ make libffi-dev openssl-dev python3-dev build-base && \
    rm -r /root/.cache

COPY requirements.txt /code/renga-ui/server/requirements.txt
WORKDIR /code/renga-ui/server/

RUN pip3 install -r requirements.txt

COPY . /code/renga-ui/server
RUN mkdir /code/renga-ui/dist

ENTRYPOINT ["python3"]
CMD ["/code/renga-ui/server/run.py"]

EXPOSE 5000
