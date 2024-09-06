Rails.application.routes.draw do
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :bars do
        member do 
          get 'events', to: 'bars#events'
        end
      end
      resources :events
      resources :beers
      resources :users do
        member do
          get 'friendships'
          post 'friendships', to: 'users#create_friendship'
        end
        resources :reviews, only: [:index]
      end

      resources :addresses
      resources :countries
      resources :reviews, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
