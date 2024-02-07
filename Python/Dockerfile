FROM python:3.10

WORKDIR /python

COPY ./ /python/

RUN pip install -r requirements.txt

EXPOSE 8888

CMD ["python", "main.py"]
