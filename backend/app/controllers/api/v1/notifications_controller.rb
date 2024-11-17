# app/controllers/notifications_controller.rb
class NotificationsController < ApplicationController
  def create
    token = params[:to]
    title = params[:title]
    body = params[:body]

    message = {
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: { someData: 'goes here' },
    }

    response = Exponent::Push::Client.new.publish(message)
    render json: response
  end
end